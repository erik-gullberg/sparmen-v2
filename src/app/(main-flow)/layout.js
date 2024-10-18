import SearchBar from "@/components/SearchBar/SearchBar";

export default function MainLayout({ children }) {
  return (
    <div>
      <SearchBar />
      {children}
    </div>
  );
}
