from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from models.schemas import SettingsSchema, SettingsUpdateSchema

router = APIRouter(prefix="/settings", tags=["settings"])

DEFAULT_SETTINGS = {
    "chunk_size": "500",
    "chunk_overlap": "50",
    "top_k": "4",
    "embedding_model": "all-MiniLM-L6-v2",
    "temperature": "0.2",
    "llm_provider": "mock",
    "api_key": ""
}

def get_current_settings(db: Session) -> dict:
    records = db.query(models.Setting).all()
    settings_dict = DEFAULT_SETTINGS.copy()
    for rec in records:
        settings_dict[rec.key] = rec.value
    return settings_dict

@router.get("", response_model=SettingsSchema)
def read_settings(db: Session = Depends(get_db)):
    """Retrieve all current system settings."""
    curr = get_current_settings(db)
    return SettingsSchema(
        chunk_size=int(curr["chunk_size"]),
        chunk_overlap=int(curr["chunk_overlap"]),
        top_k=int(curr["top_k"]),
        embedding_model=curr["embedding_model"],
        temperature=float(curr["temperature"]),
        llm_provider=curr["llm_provider"],
        api_key=curr["api_key"]
    )

@router.put("", response_model=SettingsSchema)
def update_settings(payload: SettingsUpdateSchema, db: Session = Depends(get_db)):
    """Update system settings in the SQLite database."""
    updates = payload.model_dump(exclude_unset=True)
    
    for key, value in updates.items():
        if value is not None:
            str_val = str(value)
            setting_obj = db.query(models.Setting).filter(models.Setting.key == key).first()
            if setting_obj:
                setting_obj.value = str_val
            else:
                setting_obj = models.Setting(key=key, value=str_val)
                db.add(setting_obj)
    
    db.commit()
    return read_settings(db=db)
