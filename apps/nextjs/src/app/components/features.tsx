import { ShoppingBag } from "lucide-react";

function Features() {
  const features = [
    {
      title: "Dashboard",
      description: "Easily create a product on our blazingly fast dashboard",
      icon: <ShoppingBag />,
    },
    {
      title: "Analytics",
      description: "Publish your product to the community",
      icon: <ShoppingBag />,
    },
    {
      title: "Shipping",
      description: "Start making money from your product",
      icon: <ShoppingBag />,
    },
    {
      title: "Payment",
      description: "Start making money from your product",
      icon: <ShoppingBag />,
    },
    {
      title: "Auction",
      description: "Start making money from your product",
      icon: <ShoppingBag />,
    },
  ];

  return (
    <section className="flex flex-col items-center">
      <div className="mt-16 md:mt-0">
        <h2 className="text-4xl font-bold lg:text-5xl lg:tracking-tight">
          Everything you need to start selling
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Pachi comes with a lot of features that you can use to manage your
          sells
        </p>
      </div>

      <div className="mt-16 grid gap-16 sm:grid-cols-2 md:grid-cols-3">
        {features.map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="mt-1 h-8 w-8  shrink-0 rounded-full bg-black p-2">
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>{" "}
              <p className="mt-2 leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { Features };
