import { ShoppingBag } from "lucide-react";

function Features() {
  const features = [
    {
      title: "Dashboard",
      description: "Easily create a product with our blazingly fast dashboard",
      icon: <ShoppingBag />,
    },
    {
      title: "Analytics",
      description: "Analyze your sells with our powerful analytics tool.",
      icon: <ShoppingBag />,
    },
    {
      title: "Shipping",
      description: "Choose the best shipping method for your product.",
      icon: <ShoppingBag />,
    },
    {
      title: "Payment",
      description:
        "Handle your payment with ease, we support multiple payment methods.",
      icon: <ShoppingBag />,
    },
    {
      title: "Auction",
      description:
        "You can even auction your product! We made it fun and easy for you.",
      icon: <ShoppingBag />,
    },
    {
      title: "Community",
      description:
        "Our most powerful feature. Pachi makes it easy to connect and build you community.",
      icon: <ShoppingBag />,
    },
  ];

  return (
    <section className="flex flex-col items-center px-6 sm:px-14 ">
      <div className="">
        <h2 className="text-center text-4xl font-bold lg:text-5xl lg:tracking-tight">
          Everything you need to start selling
        </h2>
        <p className="mt-8 text-center text-lg text-slate-600">
          Pachi comes with a lot of features that you can use to manage your
          sells
        </p>
      </div>

      <ul className="mt-8 grid w-full gap-4 sm:grid-cols-2 md:w-10/12 md:grid-cols-3">
        {features.map((item, i) => (
          <li key={i} className="flex items-start gap-4 rounded-2xl border p-4">
            <div className="flex h-full items-center md:items-start">
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>{" "}
              <p className="mt-2 leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { Features };
