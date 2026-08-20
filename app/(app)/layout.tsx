import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: LayoutProps<"/">) {
  // Deliberately bare apart from the toaster. The dashboard and settings bring
  // their own header, and the editor is full-bleed chrome of its own — wrapping
  // it in a second header would just steal vertical space from the canvas.
  //
  // The toaster lives here rather than in the root layout because it is a
  // client component, and a public profile has nothing to toast. Putting it at
  // the root would ship it to every visitor of every profile.
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}
