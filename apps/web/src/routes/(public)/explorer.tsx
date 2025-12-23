import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/explorer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/explorer"!</div>
}
