import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import Link from "next/link";

export function MelodyLink(props) {
  return (
    <p className={pageStyle.melody}>
      Melodi:{" "}
      <Link
        href={props.song.melody_link}
        target="_blank"
        rel="noopener noreferrer"
        className={pageStyle.melodyLink}
      >
        {props.song.melody}
      </Link>
    </p>
  );
}
