import { getDestinations } from "@/lib/destinations";
import { SearchScreen } from "@/components/dive-search/search-screen";

export default async function Home() {
  const destinations = await getDestinations();
  return <SearchScreen destinations={destinations} />;
}
