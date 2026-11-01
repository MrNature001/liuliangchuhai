@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo 正在读取 接单\客户资料\order.json ...
uv run --project apps/api python -I scripts/new_order.py "接单/客户资料/order.json"
echo.
echo 成品在 接单\交付\ 里，按客户名和日期分好文件夹。
pause
