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

export const deriveTitle = (body: string): string => {
    const firstLine = body.split('\n').find((line) => line.trim().length > 0);
    if (!firstLine) {
        return '(untitled note)';
    }
    const trimmed = firstLine.trim();
    return trimmed.length > 48 ? `${trimmed.slice(0, 48).trimEnd()}…` : trimmed;
};

export const getCompactDate = (epoch: string | number): string => {
    return new Date(Number(epoch)).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

export const stripMarkdown = (body: string): string => {
    return body
        .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> link text
        .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headers
        .replace(/^\s*>\s?/gm, '') // blockquotes
        .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
        .replace(/\*([^*]+)\*/g, '$1') // italic
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1') // strikethrough
        .replace(/`([^`]+)`/g, '$1') // inline code
        .replace(/\s+/g, ' ')
        .trim();
};