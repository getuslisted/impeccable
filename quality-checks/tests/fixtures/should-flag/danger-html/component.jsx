export function Article({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
