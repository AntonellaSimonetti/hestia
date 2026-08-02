import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {technologies} from "../data/technologies"
import {team} from "../data/team";
import { useState } from "react";
import { MdLocalFireDepartment } from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";


function AboutUs() {
    const [selectedMember, setSelectedMember] = useState(null);
    return (
        <div className="flex flex-col min-h-screen bg-(--hestia-bg)">
              <main>
                <section id="about-hestia" className="py-6 md:py-10 bg-(--hestia-bg)">
                    <div className="max-w-5xl mx-auto px-16 grid md:grid-cols-2 gap-1 items-center">
                        <div className="grid gap-4">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
                                Sobre <span className="font-newsreader italic text-4xl md:text-5xl text-(--hestia-accent)">HestIA</span>
                            </h2>
                            <p className="text-(--hestia-text) text-justify">
                                Hestia nació como un proyecto de curso impulsado por la necesidad de simplificar la cocina diaria.
                            </p>
                            <p className="text-(--hestia-text) text-justify">
                                Sabemos lo frustrante que es abrir la heladera a último momento y no saber qué preparar, por lo que diseñamos una solución que transforma tus ingredientes disponibles en recetas rápidas, sencillas y deliciosas.
                            </p>
                        </div>
                        <div>
                             <img src="/imgs/logo.png" alt="Logo HestIA" className="w-60 mx-auto dark:hidden"/>
                             <img src="/imgs/logo-dark.png" alt="Logo HestIA" className="w-60 mx-auto hidden dark:block"/>
                        </div>
                    </div>
                </section>
                <section id="hestia-cifra" className="py-4 md:py-3 bg-(--hestia-sidebar)">
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-(--hestia-text)">
                            <span className="font-newsreader italic text-3xl md:text-4xl text-(--hestia-accent)">HestIA</span> en cifras
                        </h2>
                        <p className="text-(--hestia-text)">
                            En una encuesta realizada en el 2026 se obtuvieron los siguientes resultados
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-2 px-5 items-center justify-items-center">
                        <div className="border rounded-full p-4 w-50 h-50 flex flex-col items-center justify-center gap-2 text bg-(--hestia-card)">
                            <h3 className="font-newsreader font-bold italic text-3xl md:text-4xl text-center text-(--hestia-accent)">55%</h3>
                            <p className="text-sm text-center">son estudiantes con tiempos acotados para cocinar</p>
                        </div>
                        <div className="border rounded-full p-4 w-50 h-50 flex flex-col items-center justify-center gap-2 text bg-(--hestia-card-2)">
                            <h3 className="font-newsreader font-bold italic text-3xl md:text-4xl text-center text-(--hestia-accent)">87%</h3>
                            <p className="text-sm text-center">necesita resolver sus comidas diarias en 30 minutos o menos</p>
                        </div>
                        <div className="border rounded-full p-4 w-50 h-50 flex flex-col items-center justify-center gap-2 text bg-(--hestia-card)">
                            <h3 className="font-newsreader font-bold italic text-3xl md:text-4xl text-center text-(--hestia-accent)">89%</h3>
                            <p className="text-sm text-center">prefiere cocinar utilizando los ingredientes que ya tiene en su despensa</p>
                        </div>
                    </div>
                </section>
                <section id="enfoque" className="pt-5 bg-(--hestia-bg)">
                    <div className="max-w-5xl max-h-4xl mx-auto grid md:grid-cols-2 gap-12 px-5">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-(--hestia-text) text-center mb-8">
                            A quienes ayudamos
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <img src="/imgs/personas-solas.png" alt="Persona sola" className="w-full dark:hidden"/>
                                    <img src="/imgs/personas-solas-dark.png" alt="Persona sola dark" className="w-full hidden dark:block"/>
                                </div>
                                <div>
                                    <img src="/imgs/estudiantes.png" alt="Estudiante" className="w-full dark:hidden"/>
                                    <img src="/imgs/estudiantes-dark.png" alt="Estudiante dark" className="w-full hidden dark:block"/>
                                </div>
                                <div>
                                    <img src="imgs/familias.png" alt="familia" className="w-full dark:hidden"/>
                                    <img src="imgs/familias-dark.png" alt="familia dark" className="w-full hidden dark:block"/>
                                </div>
                                <div>
                                    <img src="imgs/ahorrar.png" alt="ahorrar" className="w-full dark:hidden"/>
                                    <img src="imgs/ahorrar-dark.png" alt="ahorrar" className="w-full hidden dark:block"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-(--hestia-text) text-center mb-8">Lo que nos diferencia                            
                            </h2>
                                <div>
                                    <img src="/imgs/enfoque.png" alt="Persona sola" className="w-full dark:hidden"/>
                                    <img src="/imgs/enfoque-dark.png" alt="Persona sola dark" className="w-full hidden dark:block"/>
                                </div>
                        </div>
                    </div>
                </section>
                <section id="stack" className="py-5 md:py-5 bg-(--hestia-sidebar)">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-(--hestia-text) pb-2.5 text-center">Tecnologías y Herramientas</h2>
                        <Swiper modules={[Autoplay]} autoplay={{ delay: 1000, disableOnInteraction: false,}} loop={true} slidesPerView={3} spaceBetween={40}>

                        {technologies.map((tech) => {
                        const Icon = tech.icon;

                            return (
                        <SwiperSlide key={tech.name}>
                            <div className="flex flex-col items-center py-0.5">
                                <Icon className="text-(--hestia-accent) text-5xl transition-transform duration-300 hover:scale-130" />
                                <p>{tech.name}</p>
                            </div>
                        </SwiperSlide>
                                    );
                        })}
                        </Swiper>
                </section>
                <section id="team" className="py-10 bg-(--hestia-bg)">
                    {/* Título */}
                    <div className="max-w-5xl max-h-4xl mx-auto grid md:grid-cols-2 gap-1 px-5">
                        <h2 className="font-newsreader font-semibold italic text-3xl md:text-4xl text-(--hestia-accent)"><span className="font-newsreader font-semibold italic text-5xl md:text-6xl text-(--hestia-accent)">H</span>uman <span className="font-newsreader font-semibold italic text-5xl md:text-6xl text-(--hestia-accent)">I</span>ntelligence</h2>
                        <p className="text-(--hestia-text) text-xl self-center">Las personas detrás de <span className="font-newsreader font-semibold italic text-2xl md:text-3xl text-(--hestia-accent)">HestIA</span></p>
                    </div>
                    {/* Tarjetas simples */}
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 py-10">
                        {team.map((member) => (
                            <div key={member.id} onClick={() => setSelectedMember(member)} className="group flex flex-col items-center py-4 cursor-pointer transition-all duration-300 hover:-translate-y-1">
                                <img src={member.foto} alt={member.nombre} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-(--hestia-border) transition-all duration-300 group-hover:scale-110 group-hover:border-(--hestia-accent) group-hover:shadow-lg"/>
                                <h3 className="font-semibold font-newsreader text-(--hestia-text)">{member.nombre}</h3>
                                <p className="text-sm text-(--hestia-muted)">{member.rol}</p>
                            </div>))}
                    </div>
                    {/* Tarjetas cuando seleccionas */}
                    {selectedMember && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}> {/* click afuera = cerrar */}
                    <div className="bg-(--hestia-card) rounded-3xl p-8 w-md" onClick={(e) => e.stopPropagation()}> {/* evita que el click adentro cierre el modal */}
                        {/* Botón */}
                        <div className="flex justify-end"><button title="Regresar" onClick={() => setSelectedMember(null)} className="flame-hover text-2xl text-(--hestia-muted) hover:text-(--hestia-accent) transition-colors cursor-pointer"><MdLocalFireDepartment /></button>
                        </div>
                            {/* Foto + nombre + rol */}
                            <div className="flex items-center gap-4 mb-4">
                                <img src={selectedMember.foto} alt={selectedMember.nombre} className="w-25 h-25 rounded-full object-cover border-2 border-(--hestia-accent)"/>
                                <div className="flex flex-col">
                                <h3 className="font-newsreader font-semibold text-xl text-(--hestia-text)">{selectedMember.nombre}</h3>
                                <p className="text-sm text-(--hestia-muted)">{selectedMember.rol}</p>
                                </div>
                            </div>
                            {/* Separador */}
                            <hr className="border-(--hestia-border) mb-4"/>
                            {/* Frase y Autor */}
                            {selectedMember.cita && (
                                <figure className="text-center mb-4 px-2">
                                <blockquote className="italic text-s text-(--hestia-text)">
                                <span className="text-xl text-(--hestia-accent) font-serif mr-1">“</span>
                                {selectedMember.cita}
                                <span className="text-xl text-(--hestia-accent) font-serif ml-1">”</span>
                                </blockquote>
                                {selectedMember.autorCita && (
                                <figcaption className="text-xs text-(--hestia-muted) mt-2 font-medium">
                                — <cite className="not-italic">{selectedMember.autorCita}</cite>
                                </figcaption>
                                    )}
                                 </figure>
                                )}
                            {/* Separador */}
                            <hr className="border-(--hestia-border) mb-4"/>
                            {/* Redes */}
                            <div className="flex gap-20 justify-center">
                                {selectedMember.github && (<a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-xs text-(--hestia-muted) hover:text-(--hestia-accent) transition-colors"><FaGithub size={25} /> GitHub</a>)}
                                {selectedMember.linkedin && (<a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-xs text-(--hestia-muted) hover:text-(--hestia-accent) transition-colors"><FaLinkedin size={25} /> LinkedIn</a>)}
                            </div>
                    </div>
                    </div>)}
                </section>
              </main>
            </div>
          );
        }

export default AboutUs;


