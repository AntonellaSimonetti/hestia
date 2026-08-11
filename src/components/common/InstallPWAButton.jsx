import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState(null);

  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
  });

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();

    const result =
      await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-(--hestia-accent)
        px-4
        py-2.5
        text-sm
        font-semibold
        text-white
        transition-all
        hover:opacity-90
      "
    >
      <Download size={17} />

      <span>Instalar HestIA</span>
    </button>
  );
}