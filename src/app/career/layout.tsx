import { CareerProviders } from "./providers";

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return <CareerProviders>{children}</CareerProviders>;
}
