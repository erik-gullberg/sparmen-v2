import style from "./page.module.css";

export default function Loading() {
  return (
    <div className={style.profileHeader}>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#e0e0e0'
      }} />
      <h1>Laddar profil...</h1>
    </div>
  );
}
