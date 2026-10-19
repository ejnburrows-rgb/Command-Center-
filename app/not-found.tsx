import Link from "next/link";
export default function NotFound(){return <main className="main"><section className="panel"><h1>Page not found</h1><p>The project or address is not available.</p><Link className="btn primary" href="/projects">Browse projects</Link> <Link href="/">Home</Link></section></main>}
