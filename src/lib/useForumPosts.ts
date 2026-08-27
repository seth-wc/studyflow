import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Off the Clock's Photo Forum lives in its own top-level Firestore
// collection, not inside a user's private users/{uid} document — it's the
// one place in this app where every signed-in user reads the same shared
// data instead of just their own. See firestore.rules for the read/write
// boundary: anyone signed in can read every post, but can only create a
// post as themselves and only edit/delete their own.
export interface ForumPost {
  id: string;
  authorUid: string;
  authorName: string; // snapshot of the poster's display name at post time
  location: string;
  driveLink: string;
  createdAt: string; // ISO datetime, client-stamped (same convention as Task.createdAt)
}

export function useForumPosts() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "forumPosts"),
      (snap) => {
        setPosts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ForumPost, "id">) }))
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Forum sync error", err);
        setError("Couldn't load forum posts — check your connection.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  async function addPost(post: Omit<ForumPost, "id" | "createdAt">) {
    await addDoc(collection(db, "forumPosts"), {
      ...post,
      createdAt: new Date().toISOString(),
    });
  }

  async function deletePost(id: string) {
    await deleteDoc(doc(db, "forumPosts", id));
  }

  return { posts, loading, error, addPost, deletePost };
}
