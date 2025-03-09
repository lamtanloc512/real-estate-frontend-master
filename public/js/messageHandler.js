export function showMessage(paramModalTitle, paramMessage){
    const modalTitle = document.getElementById('errorModalLabel');
    const modalMessage = document.getElementById('errorModalMessage');
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modalTitle.textContent = paramModalTitle;
    modalMessage.textContent = paramMessage;
    modal.show();
}