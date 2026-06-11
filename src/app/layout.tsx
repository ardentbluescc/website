// Root layout — html/body provided by each route group's own layout.
// (frontend) and (payload)/admin each render <html><body> independently.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
