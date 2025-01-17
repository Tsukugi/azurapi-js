// UpdateChecker.ts
/**
 * Check for updates and functions relating to updates
 * @packageDocumentation
 */
import { FileManager } from '@atsu/multi-env-impl';
import { DatabaseURLs, LocalFiles } from '../database';
import { Datatype, VersionState } from '../state';
import { FetchAPI } from '../utils/api';

interface VersionHandlerProps {
  fileManager: FileManager;
  localFiles: LocalFiles;
  fetchAPI: FetchAPI;
  version: VersionState;
  onUpdate: (version: VersionState) => void;
}

export type VersionHandler = ReturnType<typeof createVersionHandler>;

export const createVersionHandler = (props: VersionHandlerProps) => {
  const { fileManager, fetchAPI, localFiles, version, onUpdate } = props;
  const supportedModules: Datatype[] = ['ships', 'equipments', 'chapters', 'barrages', 'voicelines'];

  const getLatestVersion = async () => await fetchAPI.get<VersionState>({ path: DatabaseURLs.version });

  const updateLocalVersion = async () => {
    const newVersion = await getLatestVersion();

    onUpdate(newVersion);
    fileManager.write(localFiles.versionInfoFile, newVersion);
    return newVersion;
  };

  const getLocalVersion = () => {
    if (fileManager.exists(localFiles.versionInfoFile)) {
      return fileManager.read<VersionState>(localFiles.versionInfoFile);
    } else if (version['version-number']) {
      return version;
    }
    return null;
  };
  /**
   * Check for updates
   */
  const getModulesToUpdate = async (): Promise<Datatype[]> => {
    const currentVersion = getLocalVersion();
    let modulesToUpdate: Datatype[] = [];

    if (currentVersion) {
      const latestVersion = await getLatestVersion();
      supportedModules.forEach(type => {
        if (latestVersion[type]['version-number'] !== currentVersion[type]['version-number']) {
          modulesToUpdate.push(type);
        }
      });
    } else {
      await updateLocalVersion();
      modulesToUpdate = supportedModules; // We set that everything needs update when theres no version info
    }
    return modulesToUpdate;
  };

  const isLatestVersion = async (): Promise<boolean> => {
    const currentVersion = getLocalVersion();

    if (!currentVersion) return false;

    const latestVersion = await getLatestVersion();

    return latestVersion['version-number'] === currentVersion['version-number'];
  };

  return { isLatestVersion, getModulesToUpdate, updateLocalVersion, supportedModules };
};
