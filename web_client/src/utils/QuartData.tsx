export interface QuartData {
    id: string;
    payload: string;
    source_timestamp: Date | null;
    formatted_timestamp: Date;
    date: Date;
    time: string;
    source_date: Date | null;
    source_time: string | null;
    type: string;
    payload_stringify: string;
    id_stringify: string;
  }