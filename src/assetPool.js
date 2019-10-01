import { AssetSorter } from './assetSorter';
import { roundwareDefaultFilterChain } from './assetFilters';
import { coordsToPoints } from './utils';

export class AssetPool {
  constructor({ assets = [], timedAssets = [], filterChain = roundwareDefaultFilterChain, sortMethods = [], mixParams = {} }) {
    this.assets = assets.map(a => ({ 
      locationPoint: coordsToPoints(a),
      playCount: 0, 
      ...a 
    }));

    this.timedAssets = timedAssets;
    this.assetSorter = new AssetSorter({ sortMethods, ...mixParams });
    this.playingTracks = {};
    this.mixParams = mixParams;
    this.filterChain = filterChain;
    this.sortAssets();
  }

  nextForTrack(track,{ filterOutAssets = [], ...stateParams }) {
    // TODO need to account for timedAssets in the below code
    const rankedAssets = this.assets.reduce((rankings,asset) => {
      if (filterOutAssets.includes(asset)) return rankings;

      const rank = this.filterChain(asset,{ ...stateParams, ...this.mixParams });

      if (rank) {
        rankings[rank] = rankings[rank] || [];
        rankings[rank].push(asset);
      }

      return rankings;
    },{});

    const rankingGroups = Object.keys(rankedAssets);

    if (rankingGroups === []) {
      console.warn('All assets filtered out');
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first
    const priorityAssets = rankedAssets[topPriorityRanking] || [];
    priorityAssets.sort((a,b) => b.playCount - a.playCount);

    const nextAsset = priorityAssets.pop();
    if (nextAsset) nextAsset.playCount++;

    return nextAsset;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }
}
