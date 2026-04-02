import { state, setState } from "./state.js";
import { deletePost, loadDraftIntoEditor, clearEditor } from "./api.js";

export function setupDeleteModal(): void {
  const deleteModal = document.createElement("ui-modal");
  deleteModal.id = "admin-delete-modal";
  deleteModal.setAttribute("size", "s");
  deleteModal.setAttribute("dismissible", "");
  deleteModal.textContent = "Delete Post";
  const modalBody = document.createElement("div");
  modalBody.setAttribute("slot", "body");
  modalBody.textContent = "Are you sure you want to delete this post? This action cannot be undone.";
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
    try {
      const post = state.allPosts.find((p) => p.slug === state.pendingDeleteSlug);
      if (post?.persisted) {
        await deletePost(state.pendingDeleteSlug);
      }
      const newAllPosts = state.allPosts.filter((p) => p.slug !== state.pendingDeleteSlug);
      const newOpenTabs = state.openTabs.filter((t) => t.slug !== state.pendingDeleteSlug);
      if (state.currentSlug === state.pendingDeleteSlug) {
        if (newOpenTabs.length > 0) {
          setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
          loadDraftIntoEditor(newOpenTabs[newOpenTabs.length - 1]);
        } else {
          setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
          clearEditor();
        }
      } else {
        setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
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
