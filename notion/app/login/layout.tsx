// ✅ app/login/layout.tsx
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // sadece içeriği döndür, html/body YOK!
}
