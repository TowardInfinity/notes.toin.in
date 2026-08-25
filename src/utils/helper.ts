import {
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { Note, NoteType, NoteTypeType } from "./types";

export const noteConverter: FirestoreDataConverter<NoteType> = {
  toFirestore(note: WithFieldValue<NoteType>): DocumentData {
    return {
      note: {
        id: note.id,
        title: note.title,
        body: note.body,
        noteType: note.noteType,
      },
    };
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
      noteType: (data.note?.noteType) ? data.note?.noteType : "QUICK"
    };
  },
};

export const createNoteObject = (body: string, noteType: NoteTypeType = "QUICK"): Note => {
    const now: number = Date.now();
    const note: NoteType = {
        id: String(now),
        title: String(now),
        noteType,
        body
    };
    return { note };
};

export const buildEditPatch = (body: string): Record<string, unknown> => {
    return { "note.body": body.trim() };
};

export const getDateInLocalString = (epoch: string | number) => {
    return new Date(Number(epoch)).toLocaleString();
}