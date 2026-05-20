import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: hello } = useSuspenseQuery(convexQuery(api.test.hello, {}))

  return (
    <main className="p-8 flex flex-col gap-8 bg-slate-950 text-white min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-600">MOVIES</h1>
      </header>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Convex Test</h2>
        <p>{hello}</p>
      </section>
    </main>
  )
}
