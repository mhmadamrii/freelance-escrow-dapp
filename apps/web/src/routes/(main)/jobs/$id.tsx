import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/jobs/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(main)/jobs/$id"!</div>
}
