import Image from "next/image";
import { ArrowUpRight, Code2 } from "lucide-react";
import { InlineText } from "@/components/inline-text";
import type { Project } from "@/data/portfolio";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="project-card"
      data-has-thumbnail={Boolean(project.thumbnail)}
      aria-labelledby={`${project.id}-title`}
    >
      {project.thumbnail && (
        <Image
          src={project.thumbnail.src}
          alt={project.thumbnail.alt}
          width={project.thumbnail.width}
          height={project.thumbnail.height}
          sizes="(min-width: 640px) 168px, calc(100vw - 90px)"
          loading="lazy"
          className="project-thumbnail"
        />
      )}
      <div className="min-w-0">
        <h3 id={`${project.id}-title`}>
          <a
            className="project-title"
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{project.title}</span>
            <ArrowUpRight size={17} aria-hidden="true" className="link-arrow" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        <p className="project-contribution">
          <InlineText content={project.contribution} />
        </p>
        <p className="project-description">{project.description}</p>
        {project.technologies && project.technologies.length > 0 && (
          <p className="project-technologies">
            <span className="sr-only">Technologies: </span>
            {project.technologies.join(" / ")}
          </p>
        )}
        {project.source && (
          <a
            className="text-link source-link"
            href={project.source.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Code2 size={16} aria-hidden="true" />
            {project.source.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}