import { Separator } from '~/components/ui/separator'

export default function ProductOverview() {
  return (
    <article className="w-full  p-6 px-8 2xl:mt-10  ">
      <h1>Product Title</h1>
      <p>Product Overview</p>
      <Separator className="my-4" />
      <div>
        <p>Select size</p>
      </div>
      <Separator className="my-4" />
      <div>
        <p>Select color</p>
      </div>
      <Separator className="my-4" />
      <h1 className="flex h-14 items-center">$96.42</h1>
    </article>
  )
}
