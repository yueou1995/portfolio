import { ArrowDownToLine, ArrowUpRight, BriefcaseBusiness, Code2, Mail } from "lucide-react";
import { InlineText } from "@/components/inline-text";
import { ProjectCard } from "@/components/project-card";
import { Spotlight } from "@/components/spotlight";
import { ThemeToggle } from "@/components/theme-toggle";
import { portfolio } from "@/data/portfolio";

const contactIcons = { email: Mail, github: Code2, linkedin: BriefcaseBusiness };

export default function Home() {
  return (
    <>
      <Spotlight />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="page-shell relative mx-auto">
        <main id="main-content" tabIndex={-1}>
          <header className="introduction">
            <div className="introduction-heading">
              <h1>{portfolio.name}</h1>
              <ThemeToggle />
            </div>
            <p className="professional-title">{portfolio.title}</p>
          </header>

          <section className="section" aria-labelledby="about-heading">
            <h2 id="about-heading" className="section-heading">About</h2>
            <div className="about-copy">
              {portfolio.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <section className="section" aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="section-heading">Experience</h2>
            <ol className="experience-list">
              {portfolio.experience.map((experience) => (
                <li className="experience-entry" key={experience.role}>
                  <p className="experience-period">{experience.period}</p>
                  <div className="min-w-0">
                    <h3 className="experience-role">{experience.role}</h3>
                    <p className="experience-company">{experience.company}</p>
                    <p className="experience-location">{experience.location}</p>
                    <ul className="experience-highlights">
                      {experience.highlights.map((highlight, index) => (
                        <li key={index}><InlineText content={highlight} /></li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
            {portfolio.resume && (
              <a className="text-link resume-link" href={portfolio.resume.href} download>
                <ArrowDownToLine size={17} aria-hidden="true" />
                {portfolio.resume.label}
              </a>
            )}
          </section>

          <section className="section" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="section-heading">Featured Projects</h2>
            <div className="project-list">
              {portfolio.projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </section>

          <section className="section" aria-labelledby="education-heading">
            <h2 id="education-heading" className="section-heading">Education</h2>
            <p className="education">
              <span className="education-degree">{portfolio.education.degree}</span>
              {" \u00b7 "}
              <span>{portfolio.education.detail}</span>
              <br />
              {portfolio.education.school}{", "}{portfolio.education.location}
            </p>
          </section>
        </main>
        <footer className="footer">
          <ul className="contact-links flex flex-wrap items-center">
            {portfolio.contact.links.map((link) => {
              const Icon = contactIcons[link.kind];
              const isExternal = link.kind !== "email";
              return (
                <li key={link.kind}>
                  <a
                    className="contact-link"
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{link.label}</span>
                    {isExternal && <ArrowUpRight size={14} aria-hidden="true" className="link-arrow" />}
                    {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </footer>
      </div>
    </>
  );
}
