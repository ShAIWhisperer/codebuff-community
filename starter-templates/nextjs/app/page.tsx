export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        <a 
          href="https://www.codebuff.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-blue-500"
        >
          Codebuff
        </a>
        {" + "}
        <a 
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-blue-500"
        >
          NextJS
        </a>
      </h1>
    </div>
  );
}
