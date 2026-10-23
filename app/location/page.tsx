import type { Metadata } from "next";
import { LocationPickerView } from "@/features/location/components/LocationPickerView";

export const metadata: Metadata = {
  title: "Pilih Lokasi",
  description: "Atur lokasi aktif NgeTag.",
};

export default function LocationPage() {
  return <LocationPickerView />;
}
