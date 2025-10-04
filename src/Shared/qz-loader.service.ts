import { Injectable } from '@angular/core';
import * as qz from 'qz-tray';
@Injectable({
  providedIn: 'root'
})
export class QzLoaderService {

    private qz: any = qz;

  constructor() {
    // ensure promises are the native Promise implementation
    try { this.qz.api.setPromiseType(window.Promise); } catch (e) { /* ignore if not needed */ }
  }

  async connect(): Promise<void> {
    if (!this.qz) throw new Error('qz library not loaded');
    // if already connected, return
    try {
      if (this.qz.websocket && typeof this.qz.websocket.isActive === 'function' && this.qz.websocket.isActive()) {
        return;
      }
    } catch (e) { /* ignore and attempt connect */ }

    try {
      await this.qz.websocket.connect();
    } catch (err: any) {
      throw new Error('Failed to connect to QZ Tray: ' + (err?.message || err));
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.qz && this.qz.websocket && typeof this.qz.websocket.isActive === 'function' && this.qz.websocket.isActive()) {
        await this.qz.websocket.disconnect();
      }
    } catch (e) {
      // ignore disconnect errors
      console.warn('QZ disconnect error', e);
    }
  }

  async findDefaultPrinter(): Promise<string | null> {
    try {
      return await this.qz.printers.find();
    } catch (e) {
      console.warn('qz.printers.find() failed', e);
      return null;
    }
  }

  async findAllPrinters(): Promise<string[]> {
    try {
      // some qz versions have findAll, otherwise fall back to find()
      if (this.qz.printers.findAll) {
        return await this.qz.printers.findAll();
      } else {
        const p = await this.qz.printers.find();
        return p ? [p] : [];
      }
    } catch (e) {
      console.warn('qz.printers.findAll() failed', e);
      return [];
    }
  }

  createConfig(printerName: string, opts?: any) {
    return this.qz.configs.create(printerName, opts || {});
  }

  async print(config: any, pieces: any[]): Promise<void> {
   }}