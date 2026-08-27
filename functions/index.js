const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

// Fires whenever a new Photo Forum post is created. Notifies every other
// signed-in user's registered device (never the poster's own), then prunes
// any device token FCM reports as no-longer-valid so pushTokens doesn't
// slowly fill up with dead entries. Runs with Admin SDK privileges, so it
// reads pushTokens directly -- clients can't (see firestore.rules).
exports.notifyOnForumPost = onDocumentCreated("forumPosts/{postId}", async (event) => {
  const post = event.data?.data();
  if (!post) return;

  const db = getFirestore();
  const tokensSnap = await db.collection("pushTokens").get();

  const recipientTokens = [];
  const tokenToDocId = new Map();
  tokensSnap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.uid === post.authorUid) return; // never notify the poster of their own post
    if (typeof data.token !== "string") return;
    recipientTokens.push(data.token);
    tokenToDocId.set(data.token, docSnap.id);
  });

  if (recipientTokens.length === 0) return;

  const title = "New Photo Forum post";
  const body = `${post.authorName ?? "Someone"} posted from ${post.location ?? "somewhere"}`;

  const response = await getMessaging().sendEachForMulticast({
    tokens: recipientTokens,
    // Data-only payload (no top-level "notification" key): sending a
    // "notification" field makes the browser auto-display its own
    // notification IN ADDITION to the one our handlers below show
    // explicitly, producing two banners for one post. Data-only puts us
    // in full control -- exactly one notification, shown by our code.
    data: { url: "/studyflow/#/forum", postId: event.params.postId, title, body },
  });

  const staleDocIds = [];
  response.responses.forEach((result, i) => {
    if (result.success) return;
    const code = result.error?.code ?? "";
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      const docId = tokenToDocId.get(recipientTokens[i]);
      if (docId) staleDocIds.push(docId);
    }
  });

  await Promise.all(staleDocIds.map((id) => db.collection("pushTokens").doc(id).delete()));
});
