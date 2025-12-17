import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/freelancers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(main)/freelancers/"!</div>
}
