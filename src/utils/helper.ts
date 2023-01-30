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

export type Note = {
    note: NoteType
};

export const createNoteObject = (body: string): Note => {
    const now: number = Date.now();
    const note: NoteType = {
        id: String(now),
        title: String(now),
        body
    };
    return { note };
};

export const getDateInLocalString = (epoch: any) => {
    return new Date(Number(epoch)).toLocaleString();
}