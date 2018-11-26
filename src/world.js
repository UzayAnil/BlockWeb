import {Chunk, CHUNK_WIDTH} from "./chunk.js";
import {raycast} from "./raycast.js";
import * as vector3 from "./vector3.js";

export class World
{
	constructor(display)
	{
		this.getBlock = this.getBlock.bind(this);
		this.display = display;
		this.chunks = {};
	}
	
	touchChunk(x, y, z)
	{
		if(!this.chunks[z]) {
			this.chunks[z] = {};
		}
		
		let slice = this.chunks[z];
		
		if(!slice[y]) {
			slice[y] = {};
		}
		
		let column = slice[y];
		
		if(!column[x]) {
			column[x] = new Chunk(x, y, z, this.display);
		}
	}
	
	getChunkPos(x, y, z)
	{
		return [
			Math.floor(x / CHUNK_WIDTH),
			Math.floor(y / CHUNK_WIDTH),
			Math.floor(z / CHUNK_WIDTH),
		];
	}
	
	getLocalPos(x, y, z)
	{
		let chunkPos = this.getChunkPos(x, y, z);
		
		return [
			x - chunkPos[0] * CHUNK_WIDTH,
			y - chunkPos[1] * CHUNK_WIDTH,
			z - chunkPos[2] * CHUNK_WIDTH,
		];
	}
	
	getChunk(x, y, z)
	{
		if(!this.chunks[z]) {
			return null;
		}
		
		let slice = this.chunks[z];
		
		if(!slice[y]) {
			return null;
		}
		
		let column = slice[y];
		
		if(!column[x]) {
			return null;
		}
		
		return column[x];
	}
	
	getBlock(x, y, z)
	{
		let chunkPos = this.getChunkPos(x, y, z);
		let localPos = this.getLocalPos(x, y, z);
		let chunk = this.getChunk(...chunkPos);
		
		if(!chunk) {
			return null;
		}
		
		return chunk.getBlock(...localPos);
	}
	
	setBlock(x, y, z, t)
	{
		let chunkPos = this.getChunkPos(x, y, z);
		let localPos = this.getLocalPos(x, y, z);
		let chunk = this.getChunk(...chunkPos);
		
		if(!chunk) {
			return;
		}
		
		chunk.setBlock(...localPos, t);
	}
	
	hitBlock(dirvec, pos, raylength = 8)
	{
		let hit = raycast(
			pos[0], pos[1], pos[2],
			dirvec[0] * raylength,
			dirvec[1] * raylength,
			dirvec[2] * raylength,
			this.getBlock,
		);
		
		if(hit) {
			let isec = [hit.cx, hit.cy, hit.cz];
			let blockpos = [hit.ix, hit.iy, hit.iz];
			let sqdist = vector3.squareDist(pos, isec);
			let dist = vector3.dist(pos, isec);
			let axis = hit.axis;
			
			let faceid = (
				hit.nx > 0 ? 1 :
				hit.nx < 0 ? 3 :
				hit.ny > 0 ? 4 :
				hit.ny < 0 ? 5 :
				hit.nz > 0 ? 2 :
				hit.nz < 0 ? 0 :
				0
			);
			
			return {isec, blockpos, sqdist, dist, faceid, axis};
		}
	}
}