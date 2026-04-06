import { state, setState } from "./state.js";
import { deletePost, deleteProject, loadPostIntoEditor, loadProjectIntoEditor, clearEditor } from "./api.js";

export function setupDeleteModal(): void {
  const deleteModal = document.createElement("ui-modal");
  deleteModal.id = "admin-delete-modal";
  deleteModal.setAttribute("size", "m");
  deleteModal.setAttribute("dismissible", "");
  deleteModal.textContent = "Delete Item";
  const modalBody = document.createElement("div");
  modalBody.setAttribute("slot", "body");
  modalBody.textContent = "Are you sure you want to delete this item? This action cannot be undone.";
  const modalFooter = document.createElement("div");
  modalFooter.setAttribute("slot", "footer-end");
  modalFooter.style.cssText = "display:flex;gap:8px;";
  const cancelBtn = document.createElement("ui-button");
  cancelBtn.setAttribute("action", "secondary");
  cancelBtn.setAttribute("size", "s");
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => {
    setState({ pendingDeleteSlug: null });
    (deleteModal as any).close();
  };
  const confirmBtn = document.createElement("ui-button");
  confirmBtn.setAttribute("action", "destructive");
  confirmBtn.setAttribute("size", "s");
  confirmBtn.textContent = "Delete";
  confirmBtn.onclick = async () => {
    if (!state.pendingDeleteSlug) return;
    confirmBtn.setAttribute("status", "loading");

    const isProject = state.pendingDeleteSlug.startsWith("project:");
    const slug = isProject ? state.pendingDeleteSlug.slice(8) : state.pendingDeleteSlug;

    try {
      if (isProject) {
        const project = state.allProjects.find((p) => p.slug === slug);
        if (project?.persisted) {
          await deleteProject(slug);
        }
        const newAllProjects = state.allProjects.filter((p) => p.slug !== slug);
        const newOpenProjectTabs = state.openProjectTabs.filter((t) => t.slug !== slug);
        if (state.currentSlug === slug && state.activeTabType === "project") {
          if (newOpenProjectTabs.length > 0) {
            setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, pendingDeleteSlug: null });
            loadProjectIntoEditor(newOpenProjectTabs[newOpenProjectTabs.length - 1]);
          } else if (state.openTabs.length > 0) {
            setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, pendingDeleteSlug: null });
            loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
          } else {
            setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, pendingDeleteSlug: null });
            clearEditor();
          }
        } else {
          setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, pendingDeleteSlug: null });
        }
      } else {
        const post = state.allPosts.find((p) => p.slug === slug);
        if (post?.persisted) {
          await deletePost(slug);
        }
        const newAllPosts = state.allPosts.filter((p) => p.slug !== slug);
        const newOpenTabs = state.openTabs.filter((t) => t.slug !== slug);
        if (state.currentSlug === slug && state.activeTabType === "post") {
          if (newOpenTabs.length > 0) {
            setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
            loadPostIntoEditor(newOpenTabs[newOpenTabs.length - 1]);
          } else if (state.openProjectTabs.length > 0) {
            setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
            loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
          } else {
            setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
            clearEditor();
          }
        } else {
          setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
        }
      }
      (deleteModal as any).close();
    } finally {
      confirmBtn.setAttribute("status", "none");
    }
  };
  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(confirmBtn);
  deleteModal.appendChild(modalBody);
  deleteModal.appendChild(modalFooter);
  document.body.appendChild(deleteModal);
}
