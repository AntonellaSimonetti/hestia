
function LoginPage() {
    return (
    <div className="relative min-h-screen flex items-center justify-center bg-(--hestia-card-2)">
        <img
            src="/imgs/logo.png"
            className="block dark:hidden absolute w-120 opacity-20"/>
        <img
            src="/imgs/logo-dark.png"
            className="hidden dark:block absolute w-120 opacity-20"/>

        <div className="relative z-10 h-130 w-100 bg-(--hestia-accent)/15 backdrop-blur-lg border-2 rounded-2xl">
            <div className="flex items-center justify-center my-5 mx-4">
                <form className="flex flex-col gap-5">
                    <div className="mb-8 text-center">
                    <div>
                        <img src="/imgs/logo.png" alt="Logo HestIA" className="w-20 mx-auto dark:hidden"/>
                        <img src="/imgs/logo-dark.png" alt="Logo HestIA" className="w-20 mx-auto hidden dark:block"/>
                    </div>
                        <h1 className="text-2xl font-bold text-(--hestia-text)">
                            Tu próxima receta te está esperando
                        </h1>
                        <p className="mt-2 text(--muted-foreground)">
                            Inicia sesión para continuar
                        </p>
                    </div>
                    <div>
                        <label htmlFor="email" className="block px-3 mb-2 text-sm font-medium text-hestia-text">
                            Correo electrónico
                        </label>
                        <input type="email" id="email" placeholder="ejemplo@email.com" className="w-full rounded-xl border bg-(--hestia-bg) px-4 py-3 focus:outline focus:ring-1 focus:ring-card-foreground"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block px-3 mb-2 text-sm font-medium text-hestia-text">
                            Contraseña
                        </label>
                        <input type="password" id="password" placeholder="********" className="w-full rounded-xl border bg-(--hestia-bg) px-4 py-3 focus:outline focus:ring-1 focus:--card-foreground"/>
                    </div>
                    <div className="flex justify-center">
                        <button type="submit"className="flex items-center justify-center gap-2 rounded-xl bg-primary/70 px-6 py-2 text-sm font-semibold text-(--hestia-text) border-2 border-hestia-accent-2 transition-all duration-200 hover:bg-(--hestia-accent)/80 hover:shadow-md active:scale-[0.97] focus:outline focus:ring-1 focus:ring-card-foreground cursor-pointer">
                            Entrar
                        </button>
                    </div>
                    <p className="mt-6 text-center text-sm">
                        ¿No tienes cuenta?
                    <span className="ml-1 font-semibold text-hestia-primary cursor-pointer hover:underline">
                        Regístrate
                    </span>
                    </p>    
                </form>
            </div>
        </div>
    </div>
    );
}

export default LoginPage;