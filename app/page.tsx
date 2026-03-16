import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Image src="/peacock.svg" height={100} width={100} alt="logo" />
    </div>
  );
}
// tinHtun@1999
