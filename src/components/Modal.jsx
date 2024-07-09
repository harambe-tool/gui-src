export function ModalContainer({modal, hideAction}){
    return <div onClick={hideAction} className="modal-overlay">
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {modal}
        </div>
    </div>
  }