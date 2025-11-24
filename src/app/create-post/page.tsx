import CreatePostPage from "@/components/create-post";
import TokenChecker from "@/components/TokenCheker";

export default function Page() {

  return (<>
    <TokenChecker />
    <CreatePostPage />;
  </>)
}
