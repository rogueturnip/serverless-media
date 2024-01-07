import { Insertable, Selectable } from "kysely";

export interface Database {
  media: MediaTable;
}

export interface MediaTable {
  id: string;
  original_key: string;
  resized_key: string | null;
  status: string;
  created_by: number;
}

export type Media = Selectable<MediaTable>;
export type NewMedia = Insertable<MediaTable>;
