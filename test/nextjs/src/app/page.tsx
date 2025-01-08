import { scratchAuthLogin } from "@scratch-auth-component/nextjs";

export default function Home() {
  return (
    <div>
      <button onClick={() => scratchAuthLogin()}>ログイン</button>
    </div>
  );
}
