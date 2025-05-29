import SearchBar from "@/components/SearchBar/SearchBar";

export const revalidate = 1800;

export default function MainLayout({ children }) {
  return (
    <div>
      <SearchBar />
      {children}
    </div>
  );
}
