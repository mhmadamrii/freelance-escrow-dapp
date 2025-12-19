import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/jobs/$id/application')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(main)/jobs/$id/application"!</div>
}
