export const metadata = {
  title: 'ExamPortal Pro',
  description: 'AI-Powered Examination Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
