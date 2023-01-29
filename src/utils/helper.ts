import {
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { NoteType } from "./types";

export const noteConverter: FirestoreDataConverter<NoteType> = {
  toFirestore(note: WithFieldValue<NoteType>): DocumentData {    
    return { id: note.id, title: note.title, body: note.body };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): NoteType {
    const data = snapshot.data(options);
    return {
      id: data.note.id,
      ref: snapshot.ref,
      title: data.note.title,
      body: data.note.body,
    };
  },
};
