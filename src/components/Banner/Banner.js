import styles from "./banner.module.css";

export default function Banner() {
  return (
    <div className={styles.banner}>
      <h3 className={styles.header}>Sommarspex! 🍍</h3>
      <small>29/05/2025</small>
      <p className={styles.paragraph}>
        Intresseanmälan för att vara med i sommarspexet 2025 sker den 2:a juni
        vid Sjön Sjön!
        <br />
        <a
          className={styles.link}
          href="https://www.facebook.com/events/680837134879277"
          target={"_blank"}
        >
          Mer info på Facebook
        </a>
      </p>
    </div>
  );
}
