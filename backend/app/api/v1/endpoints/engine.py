from fastapi import APIRouter, HTTPException, Response
import httpx
from app.core.config import settings
from app.schemas.engine import EngineGenerateRequest

router = APIRouter()

@router.post("/generate")
async def trigger_generation(payload: EngineGenerateRequest):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{settings.ENGINE_URL}/api/generate",
                json={"idea": payload.idea, "tech_stack": payload.tech_stack},
                timeout=180.0
            )
            if res.status_code != 200:
                raise HTTPException(status_code=500, detail="Engine processing failed")
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/export")
async def export_zip(payload: dict):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{settings.ENGINE_URL}/api/export",
                json=payload,
                timeout=60.0
            )
            if res.status_code != 200:
                raise HTTPException(status_code=500, detail="Engine export failed")
            return Response(
                content=res.content,
                media_type=res.headers.get("content-type", "application/zip"),
                headers={"Content-Disposition": res.headers.get("content-disposition", "attachment; filename=project.zip")}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
