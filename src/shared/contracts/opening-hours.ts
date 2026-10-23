export type DayKeyContract =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export interface OpeningHourContract {
  day: DayKeyContract;
  /** "HH:mm" 24h. */
  open: string;
  /** "HH:mm" 24h. */
  close: string;
  closed?: boolean;
}

export type OpeningHoursContract = OpeningHourContract[];
