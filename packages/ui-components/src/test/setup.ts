// happy-dom does not implement form-associated custom elements yet.
if (!HTMLElement.prototype.attachInternals) {
  HTMLElement.prototype.attachInternals = function (): ElementInternals {
    const getForm = (): HTMLFormElement | null => {
      const id = this.getAttribute("form");
      return id ? (document.getElementById(id) as HTMLFormElement | null) : this.closest("form");
    };
    return {
      get form(): HTMLFormElement | null {
        return getForm();
      },
    } as ElementInternals;
  };
}
