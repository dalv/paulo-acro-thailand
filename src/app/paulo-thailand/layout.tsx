import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Paulo in Thailand",
  description: "Multi-day acrobatic workshops in Thailand with Paulo",
};

export default function PauloThailandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}