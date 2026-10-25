import { PrivatePost } from './PrivatePost';
import '../../[slug]/blogPost.css';

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PrivatePostPage({ params }: Props) {
  const { slug } = await params;
  return <PrivatePost slug={slug} />;
}
